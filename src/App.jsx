import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import About from './pages/About';
import Favorites from './pages/Favorites';
import Projects from './pages/Projects';

export default function App() {
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/about" element={<About />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
