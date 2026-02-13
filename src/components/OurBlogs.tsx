import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const blogs = [
  {
    id: 1,
    title: 'Rural Retreats: Embracing the Tranquility of Countryside Estates',
    author: 'Devi Estates',
    readTime: '13 min',
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Luxury Living: Navigating the World of High-End Real Estate',
    author: 'Devi Estates',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Unlocking the Charm: Exploring the Allure of Historic Homes',
    author: 'Devi Estates',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const OurBlogs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-display">
            Our Blogs
          </h2>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-orange-500 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300">
            Read All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {blogs.map((blog) => (
            <div key={blog.id} className="group cursor-pointer">
              {/* Image */}
              <div className="overflow-hidden rounded-2xl mb-4 aspect-[4/3]">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {/* Content */}
              <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2 group-hover:text-orange-500 transition-colors">
                {blog.title}
              </h3>
              <p className="text-gray-500 text-sm">
                {blog.author} . {blog.readTime}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurBlogs;
