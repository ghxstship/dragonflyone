import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch weather data for event/venue
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
    const venue_id = searchParams.get('venue_id');
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lon');

    let lat, lon;

    // Get coordinates from event or venue
    if (event_id) {
      const { data: event } = await supabase
        .from('events')
        .select('*, venues(*)')
        .eq('id', event_id)
        .single();

      if (event?.venues) {
        lat = event.venues.latitude;
        lon = event.venues.longitude;
      }
    } else if (venue_id) {
      const { data: venue } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venue_id)
        .single();

      if (venue) {
        lat = venue.latitude;
        lon = venue.longitude;
      }
    } else if (latitude && longitude) {
      lat = parseFloat(latitude);
      lon = parseFloat(longitude);
    }

    if (!lat || !lon) {
      return NextResponse.json({ 
        error: 'Location coordinates not found' 
      }, { status: 400 });
    }

    // Fetch weather data from OpenWeatherMap API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Weather service not configured' 
      }, { status: 503 });
    }

    try {
      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );
      const currentWeather = await currentResponse.json();

      // 7-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );
      const forecastData = await forecastResponse.json();

      // Weather alerts
      const alertsResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=imperial`
      );
      const alertsData = await alertsResponse.json();

      // Store weather data for historical tracking
      if (event_id) {
        await supabase.from('weather_logs').insert({
          event_id,
          latitude: lat,
          longitude: lon,
          temperature: currentWeather.main?.temp,
          feels_like: currentWeather.main?.feels_like,
          humidity: currentWeather.main?.humidity,
          wind_speed: currentWeather.wind?.speed,
          wind_direction: currentWeather.wind?.deg,
          conditions: currentWeather.weather?.[0]?.main,
          description: currentWeather.weather?.[0]?.description,
          precipitation_probability: forecastData.list?.[0]?.pop * 100,
          raw_data: currentWeather,
          logged_at: new Date().toISOString()
        });
      }

      return NextResponse.json({
        current: {
          temperature: currentWeather.main?.temp,
          feels_like: currentWeather.main?.feels_like,
          humidity: currentWeather.main?.humidity,
          pressure: currentWeather.main?.pressure,
          wind_speed: currentWeather.wind?.speed,
          wind_direction: currentWeather.wind?.deg,
          conditions: currentWeather.weather?.[0]?.main,
          description: currentWeather.weather?.[0]?.description,
          icon: currentWeather.weather?.[0]?.icon,
          visibility: currentWeather.visibility,
          uv_index: alertsData.current?.uvi
        },
        forecast: forecastData.list?.slice(0, 40).map((item: any) => ({
          datetime: item.dt_txt,
          temperature: item.main.temp,
          conditions: item.weather[0].main,
          description: item.weather[0].description,
          precipitation_probability: item.pop * 100,
          wind_speed: item.wind.speed
        })),
        alerts: alertsData.alerts || [],
        location: {
          latitude: lat,
          longitude: lon,
          name: currentWeather.name
        }
      });
    } catch (error: any) {
      return NextResponse.json({ 
        error: 'Failed to fetch weather data',
        details: error.message 
      }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'weather:fetch', resource: 'weather' }
  }
);

// POST - Create weather alert/contingency
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { event_id, alert_type, threshold, action_plan, recipients } = body;

    if (!event_id || !alert_type) {
      return NextResponse.json({ 
        error: 'event_id and alert_type are required' 
      }, { status: 400 });
    }

    const { data: alert, error } = await supabase
      .from('weather_alerts')
      .insert({
        event_id,
        alert_type, // 'rain', 'wind', 'temperature', 'lightning', etc.
        threshold,
        action_plan,
        recipients,
        active: true,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      alert,
      message: 'Weather alert created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'weather:create_alert', resource: 'weather' }
  }
);

// PUT - Update weather contingency plan
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { event_id, contingency_plan } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .update({
        weather_contingency: contingency_plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', event_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      event: data,
      message: 'Weather contingency plan updated'
    });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'weather:update_contingency', resource: 'weather' }
  }
);
