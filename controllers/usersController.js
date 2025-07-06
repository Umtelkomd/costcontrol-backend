const { AppDataSource } = require('../data-source');

const usersController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      const users = await userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Simple login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userRepository = AppDataSource.getRepository('User');
      const user = await userRepository.findOne({ 
        where: { email: email, active: true } 
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Simple password verification (no hash for simplicity)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        message: 'Login successful' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create user
  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (role !== 'creator' && role !== 'approver') {
        return res.status(400).json({ error: 'Role must be "creator" or "approver"' });
      }

      const userRepository = AppDataSource.getRepository('User');
      
      // Check if email already exists
      const existingUser = await userRepository.findOne({ 
        where: { email: email } 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const newUser = userRepository.create({
        name,
        email,
        password, // In production, use hash
        role,
        active: true
      });

      const savedUser = await userRepository.save(newUser);
      
      // Return without password
      const { password: _, ...userWithoutPassword } = savedUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user profile
  async getUserProfile(req, res) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository('User');
      
      const user = await userRepository.findOne({ 
        where: { id: parseInt(id) } 
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = usersController; 