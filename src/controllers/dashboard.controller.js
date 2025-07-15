// src/controllers/dashboard.controller.js

import { getDashboardData } from '../services/dashboard.service.js';

export const dashboardStats = async (req, res) => {
  try {
    const data = await getDashboardData();
    res.status(200).json({
      status: true,
      message: 'Dashboard stats fetched successfully',
      data,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};
