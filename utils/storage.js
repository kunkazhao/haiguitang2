const StorageUtil = {
  RIDDLES_KEY: 'turtle_soup_riddles',
  
  getRiddles: () => {
    try {
      const stored = localStorage.getItem(StorageUtil.RIDDLES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading riddles from localStorage:', error);
      return [];
    }
  },
  
  saveRiddles: (riddles) => {
    try {
      localStorage.setItem(StorageUtil.RIDDLES_KEY, JSON.stringify(riddles));
      return true;
    } catch (error) {
      console.error('Error saving riddles to localStorage:', error);
      return false;
    }
  },
  
  addRiddle: (riddle) => {
    try {
      const riddles = StorageUtil.getRiddles();
      const newRiddle = {
        ...riddle,
        id: Date.now().toString(),
        updatedAt: new Date().toISOString()
      };
      riddles.push(newRiddle);
      StorageUtil.saveRiddles(riddles);
      return newRiddle;
    } catch (error) {
      console.error('Error adding riddle:', error);
      return null;
    }
  },
  
  updateRiddle: (id, updates) => {
    try {
      const riddles = StorageUtil.getRiddles();
      const index = riddles.findIndex(r => r.id === id);
      if (index !== -1) {
        riddles[index] = {
          ...riddles[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        StorageUtil.saveRiddles(riddles);
        return riddles[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating riddle:', error);
      return null;
    }
  },
  
  deleteRiddle: (id) => {
    try {
      const riddles = StorageUtil.getRiddles();
      const filtered = riddles.filter(r => r.id !== id);
      StorageUtil.saveRiddles(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting riddle:', error);
      return false;
    }
  },
  
  getRiddleById: (id) => {
    try {
      const riddles = StorageUtil.getRiddles();
      return riddles.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error getting riddle by id:', error);
      return null;
    }
  }
};