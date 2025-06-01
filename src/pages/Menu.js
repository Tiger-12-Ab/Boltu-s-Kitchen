import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

const Menu = () => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      const { data, error } = await supabase.from("dishes").select("*");
      if (error) {
        console.error("Error fetching dishes:", error);
      } else {
        setDishes(data);
        
      }
    };
    fetchDishes();
  }, []);

  const categorizeDishes = (category) =>
    dishes.filter(
      (dish) => dish.category?.toLowerCase() === category.toLowerCase()
    );

  const categories = [
    { label: "Appetizers", key: "appetizer" },
    { label: "Main Course", key: "main course" },
    { label: "Desserts", key: "dessert" },
    { label: "Drinks", key: "drinks" },
  ];

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl text-forest font-bold mb-8 text-center">
          Our Menu
        </h1>
        {categories.map(({ label, key }) => {
          const dishesInCategory = categorizeDishes(key);
          return (
            <div key={key} className="mb-12">
              <h2 className="text-2xl text-forest font-semibold mb-4 border-b pb-2">
                {label}
              </h2>
              {dishesInCategory.length === 0 ? (
                <p className="text-charcoal italic text-center">No dishes found.</p>
              ) : (
                <div className="flex flex-wrap justify-center gap-6">
                  {dishesInCategory.map((dish) => (
                    <Link
                      to={`/dish/${dish.id}`}
                      key={dish.id}
                      className="w-[180px] h-[300px] bg-cream rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300 flex flex-col"
                    >
                      <img
                        src={dish.image_url}
                        alt={dish.title}
                        className="h-[150px] w-full object-cover"
                      />
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-forest leading-tight">
                            {dish.title}
                          </h3>
                          <p className="text-xs text-charcoal mt-1 italic line-clamp-2">
                            {dish.short_description}
                          </p>
                        </div>
                        <div className="text-forest font-bold text-sm mt-2">
                          ${dish.price}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
