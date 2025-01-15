import {
  Coffee,
  Award,
  Users,
  Truck,
  Heart,
  Coffee as CoffeeBean
} from 'lucide-react';
import AboutImage from '../assets/about.jpg'

const AboutPage = () => {
  const stats = [
    { icon: <CoffeeBean size={32} />, value: "15+", label: "Coffee Varieties" },
    { icon: <Users size={32} />, value: "10K+", label: "Happy Customers" },
    { icon: <Award size={32} />, value: "25+", label: "Years Experience" },
    { icon: <Heart size={32} />, value: "98%", label: "Satisfaction Rate" }
  ];

  const values = [
    {
      icon: <Coffee className="text-amber-600" size={40} />,
      title: "Quality First",
      description: "We source only the finest coffee beans from sustainable farms worldwide."
    },
    {
      icon: <Award className="text-amber-600" size={40} />,
      title: "Expert Roasting",
      description: "Our master roasters bring out the unique character of every bean."
    },
    {
      icon: <Truck className="text-amber-600" size={40} />,
      title: "Swift Delivery",
      description: "Fresh roasted coffee delivered right to your doorstep."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Our Coffee Journey</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Crafting exceptional coffee experiences since 1998, bringing the finest beans from farm to cup.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
              <div className="text-amber-600 mb-4 flex justify-center">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <p className="text-gray-400 mb-4">
              Founded by coffee enthusiasts with a passion for excellence, we've grown from a small local roastery to a beloved coffee brand. Our journey has been guided by one simple principle: exceptional coffee should be accessible to everyone.
            </p>
            <p className="text-gray-400">
              We travel the world to find the best coffee beans, building lasting relationships with farmers who share our commitment to quality and sustainability. Every bean is carefully selected, roasted to perfection, and delivered fresh to ensure you experience coffee at its finest.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-amber-600/20 rounded-full blur-xl"></div>
            <div className="bg-gray-900 rounded-xl relative">
              <img
                src={AboutImage}
                alt="Coffee roasting process"
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-8 text-center">
                <div className="mb-6 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;