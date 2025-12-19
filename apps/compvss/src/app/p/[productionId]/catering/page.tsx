'use client';

import { useState } from 'react';
import {
  EnterprisePageHeader,
  MainContent,
  Container,
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
import { useCateringData } from '../../../../hooks/useCatering';

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

const DEFAULT_HEADCOUNTS: DepartmentHeadcount[] = [
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
  const { services } = useCateringData();
  const [headcounts] = useState<DepartmentHeadcount[]>(DEFAULT_HEADCOUNTS);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const meals: MealService[] = services.map((s: { id: string; meal_type: string; project_name: string; service_date: string; location: string; headcount: number; status: string; dietary_notes?: string }) => ({
    id: s.id,
    name: `${s.meal_type.charAt(0).toUpperCase() + s.meal_type.slice(1)} - ${s.project_name}`,
    date: s.service_date.split('T')[0],
    time: s.service_date.split('T')[1]?.substring(0, 5) || '12:00',
    location: s.location,
    expectedHeadcount: s.headcount,
    actualHeadcount: s.status === 'completed' ? s.headcount : 0,
    status: s.status as MealService['status'],
    mealType: s.meal_type as MealService['mealType'],
    dietaryOptions: s.dietary_notes ? s.dietary_notes.split(',') : ['Vegetarian', 'Vegan'],
  }));

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
      <EnterprisePageHeader
        title="Catering Management"
        subtitle="Track meal services and crew headcounts"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Crew" value={totalHeadcount.toString()} icon={<Users size={20} />} inverted />
          <StatCard label="Meals Served" value={mealsServed.toString()} icon={<Utensils size={20} />} inverted />
          <StatCard label="Total Servings" value={totalMealsServed.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Dietary Needs" value={`${totalVegetarian + totalVegan + totalGlutenFree}`} icon={<Calendar size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
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
                  <Grid cols={2} gap={3} className="sm:grid-cols-1 lg:grid-cols-2">
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
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
