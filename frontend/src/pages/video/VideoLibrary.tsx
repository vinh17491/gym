import { useState } from 'react';
import { Search, Play, Clock, ChevronRight, TrendingUp, Star, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../../components/ui/badge';
import Input from '../../components/ui/input';

const categories = ['All', 'Strength', 'Cardio', 'Yoga', 'HIIT', 'Recovery', 'Nutrition'];

const featuredVideo = {
  title: 'Full Body Strength Training',
  instructor: 'Coach Mike',
  duration: '45 min',
  level: 'Intermediate',
  thumbnail: null,
  views: '12.4K',
};

const videos = [
  { id: 1, title: 'HIIT Cardio Blast', instructor: 'Coach Sarah', duration: '30 min', level: 'Advanced', category: 'HIIT', views: '8.2K' },
  { id: 2, title: 'Yoga for Flexibility', instructor: 'Coach Emma', duration: '60 min', level: 'Beginner', category: 'Yoga', views: '15.1K' },
  { id: 3, title: 'Upper Body Pump', instructor: 'Coach Mike', duration: '40 min', level: 'Intermediate', category: 'Strength', views: '6.7K' },
  { id: 4, title: 'Recovery & Stretching', instructor: 'Coach Lisa', duration: '20 min', level: 'All Levels', category: 'Recovery', views: '9.3K' },
  { id: 5, title: 'Core Crusher', instructor: 'Coach Alex', duration: '25 min', level: 'Intermediate', category: 'Strength', views: '11.5K' },
  { id: 6, title: 'Dance Cardio Party', instructor: 'Coach Zoe', duration: '35 min', level: 'Beginner', category: 'Cardio', views: '7.8K' },
  { id: 7, title: 'Meal Prep Masterclass', instructor: 'Chef Ryan', duration: '50 min', level: 'All Levels', category: 'Nutrition', views: '4.2K' },
  { id: 8, title: 'Advanced Plyometrics', instructor: 'Coach Mike', duration: '40 min', level: 'Advanced', category: 'HIIT', views: '3.9K' },
];

const continueWatching = videos.slice(0, 4);

export default function VideoLibrary() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = videos.filter(v =>
    (category === 'All' || v.category === category) &&
    (search === '' || v.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="page-title">Video Library</h1>
        <p className="text-dark-400 mt-1">Workout programs, tutorials & more</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search videos..."
            icon={<Search size={18} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === c ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Video */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-900/40 via-dark-850 to-dark-850 border border-dark-700/50 group cursor-pointer"
      >
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-8 md:p-10">
            <Badge variant="green">Featured</Badge>
            <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-2">{featuredVideo.title}</h2>
            <p className="text-dark-400 mb-4">with {featuredVideo.instructor}</p>
            <div className="flex items-center gap-4 text-sm text-dark-400 mb-6">
              <span className="flex items-center gap-1"><Clock size={14} />{featuredVideo.duration}</span>
              <span>{featuredVideo.level}</span>
              <span>{featuredVideo.views} views</span>
            </div>
            <button className="btn-primary inline-flex">
              <Play size={18} /> Watch Now
            </button>
          </div>
          <div className="w-full md:w-80 h-48 md:h-auto bg-gradient-to-br from-primary-600/20 to-emerald-600/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary-600/80 flex items-center justify-center">
              <Play size={28} className="text-white ml-1" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue Watching */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2"><TrendingUp size={20} className="text-primary-400" /> Continue Watching</h2>
          <button className="btn-ghost text-sm">View All <ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {continueWatching.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover group cursor-pointer overflow-hidden"
            >
              <div className="aspect-video bg-dark-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-emerald-500/10 group-hover:scale-110 transition-transform duration-300" />
                <Play size={24} className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded">{v.duration}</span>
              </div>
              <h3 className="font-medium text-sm truncate">{v.title}</h3>
              <p className="text-xs text-dark-500 mt-0.5">{v.instructor}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Videos */}
      <section>
        <h2 className="section-title">Recommendations for You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-hover group cursor-pointer overflow-hidden"
            >
              <div className="aspect-video bg-dark-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-800 group-hover:scale-110 transition-transform duration-300" />
                <Play size={24} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded">{v.duration}</span>
                <Badge variant="blue" className="absolute top-2 left-2">{v.category}</Badge>
              </div>
              <h3 className="font-medium text-sm truncate">{v.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-dark-500">{v.instructor}</p>
                <span className="text-[10px] text-dark-500">{v.views} views</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
