import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Reverse } from './pages/Reverse';
import { Crops } from './pages/Crops';
import { Settings } from './pages/Settings';
import { BottomNav } from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto relative shadow-xl">
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reverse" element={<Reverse />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
