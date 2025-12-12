'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Grid,
  Badge,
  Button,
  Body,
  H3,
  StatCard,
  ProgressBar,
} from '@ghxstship/ui';
import { Users, Clock, Utensils, Calendar, Plus, Edit2 } from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';

interface MealService {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  expectedHeadcount: number;
  actualHeadcount: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryOptions: string[];
}

interface DepartmentHeadcount {
  department: string;
  headcount: number;
  dietary: {
    vegetarian: number;
    vegan: number;
    glutenFree: number;
    other: number;
  };
}

const DEMO_MEALS: MealService[] = [
  {
    id: '1',
    name: 'Crew Breakfast - Day 1',
    date: '2025-06-15',
    time: '06:00',
    location: 'Catering Tent A',
    expectedHeadcount: 150,
    actualHeadcount: 142,
    status: 'completed',
    mealType: 'breakfast',
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
  },
  {
    id: '2',
    name: 'Crew Lunch - Day 1',
    date: '2025-06-15',
    time: '12:00',
    location: 'Catering Tent A',
    expectedHeadcount: 200,
    actualHeadcount: 195,
    status: 'completed',
    mealType: 'lunch',
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'],
  },
  {
    id: '3',
    name: 'Crew Dinner - Day 1',
    date: '2025-06-15',
    time: '18:00',
    location: 'Catering Tent A',
    expectedHeadcount: 180,
    actualHeadcount: 0,
    status: 'in_progress',
    mealType: 'dinner',
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
  },
  {
    id: '4',
    name: 'Crew Breakfast - Day 2',
    date: '2025-06-16',
    time: '06:00',
    location: 'Catering Tent A',
    expectedHeadcount: 160,
    actualHeadcount: 0,
    status: 'scheduled',
    mealType: 'breakfast',
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
  },
  {
    id: '5',
    name: 'Crew Lunch - Day 2',
    date: '2025-06-16',
    time: '12:00',
    location: 'Catering Tent A',
    expectedHeadcount: 220,
    actualHeadcount: 0,
    status: 'scheduled',
    mealType: 'lunch',
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'],
  },
];

const DEMO_HEADCOUNTS: DepartmentHeadcount[] = [
  { department: 'Production', headcount: 45, dietary: { vegetarian: 8, vegan: 3, glutenFree: 5, other: 2 } },
  { department: 'Stage', headcount: 35, dietary: { vegetarian: 5, vegan: 2, glutenFree: 3, other: 1 } },
  { department: 'Audio', headcount: 25, dietary: { vegetarian: 4, vegan: 1, glutenFree: 2, other: 0 } },
  { department: 'Lighting', headcount: 20, dietary: { vegetarian: 3, vegan: 2, glutenFree: 1, other: 1 } },
  { department: 'Video', headcount: 15, dietary: { vegetarian: 2, vegan: 1, glutenFree: 1, other: 0 } },
  { department: 'Security', headcount: 40, dietary: { vegetarian: 6, vegan: 2, glutenFree: 4, other: 3 } },
  { department: 'Medical', headcount: 10, dietary: { vegetarian: 2, vegan: 1, glutenFree: 1, other: 0 } },
  { department: 'Hospitality', headcount: 20, dietary: { vegetarian: 4, vegan: 2, glutenFree: 2, other: 1 } },
];

const statusVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
};

const mealTypeIcons: Record<string, string> = {
  breakfast: 'Morning',
  lunch: 'Midday',
  dinner: 'Evening',
  snack: 'Snack',
};

export default function CateringPage() {
  const [meals] = useState<MealService[]>(DEMO_MEALS);
  const [headcounts] = useState<DepartmentHeadcount[]>(DEMO_HEADCOUNTS);
  const [selectedDate, setSelectedDate] = useState<string>('2025-06-15');

  const filteredMeals = meals.filter((m) => m.date === selectedDate);
  const uniqueDates = Array.from(new Set(meals.map((m) => m.date)));

  const totalHeadcount = headcounts.reduce((sum, d) => sum + d.headcount, 0);
  const totalVegetarian = headcounts.reduce((sum, d) => sum + d.dietary.vegetarian, 0);
  const totalVegan = headcounts.reduce((sum, d) => sum + d.dietary.vegan, 0);
  const totalGlutenFree = headcounts.reduce((sum, d) => sum + d.dietary.glutenFree, 0);

  const mealsServed = meals.filter((m) => m.status === 'completed').length;
  const totalMealsServed = meals
    .filter((m) => m.status === 'completed')
    .reduce((sum, m) => sum + m.actualHeadcount, 0);

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Production"
          title="Catering Management"
          description="Track meal services and crew headcounts"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Crew" value={totalHeadcount.toString()} icon={<Users size={20} />} inverted />
          <StatCard label="Meals Served" value={mealsServed.toString()} icon={<Utensils size={20} />} inverted />
          <StatCard label="Total Servings" value={totalMealsServed.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Dietary Needs" value={`${totalVegetarian + totalVegan + totalGlutenFree}`} icon={<Calendar size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Meal Schedule</H3>
                  <Stack direction="horizontal" gap={2}>
                    {uniqueDates.map((date) => (
                      <Button
                        key={date}
                        variant={selectedDate === date ? 'solid' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDate(date)}
                      >
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Button>
                    ))}
                  </Stack>
                </Stack>

                <Stack gap={3}>
                  {filteredMeals.map((meal) => (
                    <Stack key={meal.id} className="rounded-card border-2 border-ink-700 p-4">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-weight-semibold text-white">{meal.name}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="info">{mealTypeIcons[meal.mealType]}</Badge>
                            <Body size="sm" className=" text-on-dark-muted">{meal.time} - {meal.location}</Body>
                          </Stack>
                        </Stack>
                        <Badge variant={statusVariants[meal.status]}>
                          {meal.status === 'in_progress' ? 'In Progress' : meal.status.charAt(0).toUpperCase() + meal.status.slice(1)}
                        </Badge>
                      </Stack>
                      <Stack gap={2} className="mt-3 border-t border-ink-700 pt-3">
                        <Stack direction="horizontal" className="justify-between">
                          <Body className="text-on-dark-muted">Headcount</Body>
                          <Body className="text-white">
                            {meal.actualHeadcount > 0 ? `${meal.actualHeadcount} / ${meal.expectedHeadcount}` : `Expected: ${meal.expectedHeadcount}`}
                          </Body>
                        </Stack>
                        {meal.status === 'completed' && (
                          <ProgressBar value={(meal.actualHeadcount / meal.expectedHeadcount) * 100} />
                        )}
                        <Stack direction="horizontal" gap={1} className="flex-wrap">
                          {meal.dietaryOptions.map((option) => (
                            <Badge key={option} variant="info">{option}</Badge>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                  {filteredMeals.length === 0 && (
                    <Body className="text-center text-on-dark-muted py-8">No meals scheduled for this date</Body>
                  )}
                </Stack>

                <Button variant="outline" className="w-full">
                  <Plus size={16} className="mr-2" />
                  Add Meal Service
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Department Headcounts</H3>
                  <Button variant="ghost" size="sm">
                    <Edit2 size={14} className="mr-1" />
                    Edit
                  </Button>
                </Stack>

                <Stack gap={3}>
                  {headcounts.map((dept) => (
                    <Stack key={dept.department} className="rounded-card border-2 border-ink-700 p-3">
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Body className="font-weight-semibold text-white">{dept.department}</Body>
                        <Body className="font-weight-semibold text-white">{dept.headcount}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="mt-2">
                        {dept.dietary.vegetarian > 0 && (
                          <Badge variant="success">{dept.dietary.vegetarian} Veg</Badge>
                        )}
                        {dept.dietary.vegan > 0 && (
                          <Badge variant="info">{dept.dietary.vegan} Vegan</Badge>
                        )}
                        {dept.dietary.glutenFree > 0 && (
                          <Badge variant="warning">{dept.dietary.glutenFree} GF</Badge>
                        )}
                        {dept.dietary.other > 0 && (
                          <Badge variant="error">{dept.dietary.other} Other</Badge>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                <Stack className="rounded-card bg-ink-800 p-4">
                  <H3 className="text-white mb-3">Dietary Summary</H3>
                  <Grid cols={2} gap={3}>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Vegetarian</Body>
                      <Body className="font-weight-semibold text-white">{totalVegetarian} ({((totalVegetarian / totalHeadcount) * 100).toFixed(1)}%)</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Vegan</Body>
                      <Body className="font-weight-semibold text-white">{totalVegan} ({((totalVegan / totalHeadcount) * 100).toFixed(1)}%)</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Gluten-Free</Body>
                      <Body className="font-weight-semibold text-white">{totalGlutenFree} ({((totalGlutenFree / totalHeadcount) * 100).toFixed(1)}%)</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Total Crew</Body>
                      <Body className="font-weight-semibold text-white">{totalHeadcount}</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      </Stack>
    </CompvssAppLayout>
  );
}
