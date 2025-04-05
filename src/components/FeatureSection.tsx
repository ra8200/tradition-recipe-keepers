
import React from 'react';
import { BookOpen, Users, Upload, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="h-8 w-8 text-spice-600" />,
    title: "Organize Recipe Books",
    description: "Create multiple recipe books to organize family recipes by side of the family, type of cuisine, or special occasions."
  },
  {
    icon: <Users className="h-8 w-8 text-spice-600" />,
    title: "Collaborate & Share",
    description: "Invite family members to view, contribute, or manage recipe books with customizable permissions."
  },
  {
    icon: <Upload className="h-8 w-8 text-spice-600" />,
    title: "Import & Digitize",
    description: "Upload photos of handwritten recipes with OCR to automatically convert them into editable digital format."
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-spice-600" />,
    title: "Preserve & Protect",
    description: "Securely store your family's culinary heritage for future generations with controlled access."
  }
];

const FeatureSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif text-center text-recipe-800 mb-12">Keep Your Family Recipes Alive</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-recipe-100 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif text-recipe-800 mb-2">{feature.title}</h3>
              <p className="text-recipe-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
