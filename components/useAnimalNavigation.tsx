import { useState } from "react";

// Represents current UI screen
export type PetPointScreen = "home" | "category" | "foodsubcategory" | "products";

export function useAnimalNavigation() {
  const [screen, setScreen] = useState<PetPointScreen>("home");
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [foodParent, setFoodParent] = useState<string | null>(null); // dry, wet or null
  const [foodSub, setFoodSub] = useState<string | null>(null); // kilograms, bag, cans...

  function gotoHome() {
    setScreen("home");
    setSelectedAnimal(null);
    setSelectedCategory(null);
    setFoodParent(null);
    setFoodSub(null);
  }
  function gotoCategory(animal: string) {
    setScreen("category");
    setSelectedAnimal(animal);
    setSelectedCategory(null);
    setFoodParent(null);
    setFoodSub(null);
  }
  function gotoFoodSubCategory() {
    setScreen("foodsubcategory");
    setFoodParent(null);
    setFoodSub(null);
  }
  function selectFoodParent(parent: string | null) {
    setFoodParent(parent);
    if (parent) {
      setFoodSub(null);
    }
  }
  function selectFoodSub(sub: string) {
    setFoodSub(sub);
    setSelectedCategory(sub);
    setScreen("products");
  }
  function gotoProducts(animal: string, category: string) {
    if (category === "food") {
      setScreen("foodsubcategory");
      setFoodParent(null);
      setFoodSub(null);
      setSelectedCategory("food");
    } else {
      setScreen("products");
      setSelectedCategory(category);
    }
    setSelectedAnimal(animal);
  }
  return {
    screen,
    selectedAnimal,
    selectedCategory,
    foodParent,
    foodSub,
    gotoHome,
    gotoCategory,
    gotoFoodSubCategory,
    selectFoodParent,
    selectFoodSub,
    gotoProducts,
  };
}