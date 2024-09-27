export function parseMeals(meals: any[]) {
  const parsedMeals = meals.map((meal) => {
    const parsedDate = new Date(meal.date).toLocaleString('pt-BR');

    const parsedMeal = { ...meal, date: parsedDate };

    return parsedMeal;
  });

  return parsedMeals;
}
