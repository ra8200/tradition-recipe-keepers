
import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Family Traditions has helped us preserve recipes that were nearly lost when my grandmother passed away. Now, her legacy lives on in our digital cookbook.",
    author: "Sarah Johnson",
    relation: "Preserving Grandmother's Italian Recipes"
  },
  {
    quote: "We have family spread across three continents. This app lets us all contribute to our shared recipe collection no matter where we are.",
    author: "Miguel Sanchez",
    relation: "Connecting a Global Family"
  },
  {
    quote: "I discovered my great-grandfather's secret BBQ sauce recipe that no one remembered! Found it tucked in an old cookbook and now it's preserved forever.",
    author: "James Wilson",
    relation: "Rediscovering Family Secrets"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-recipe-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif text-center text-recipe-800 mb-12">Family Stories</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md relative">
              <Quote className="absolute top-4 right-4 h-10 w-10 text-recipe-200" />
              <p className="text-recipe-700 mb-6 italic relative z-10">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-recipe-800">{testimonial.author}</p>
                <p className="text-sm text-recipe-600">{testimonial.relation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
