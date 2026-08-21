const userService = require('../services/userService');

// ===== GET ALL CUSTOMERS =====
exports.listCustomers = async (req, res) => {
  try {
    console.log('👥 [GET /users/customers] Fetching all customers...');

    const customers = await userService.listCustomers();

    console.log(`✅ Found ${customers.length} customers`);

    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== GET SINGLE USER =====
exports.getOne = async (req, res) => {
  try {
    console.log('👥 [GET /users/:id] Getting user:', req.params.id);

    const user = await userService.getById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User found:', user.email);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== GET CUSTOMER BOOKINGS =====
exports.getBookings = async (req, res) => {
  try {
    console.log('📋 [GET /users/:id/bookings] Getting bookings for user:', req.params.id);

    const { bookings, stats } = await userService.getBookingsForUser(req.params.id);

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({
      success: true,
      data: bookings,
      stats
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== UPDATE USER =====
exports.update = async (req, res) => {
  try {
    console.log('✏️ [PATCH /users/:id] Updating user:', req.params.id);

    const user = await userService.update(req.params.id, req.body);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User updated:', user.id);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== DELETE USER =====
exports.remove = async (req, res) => {
  try {
    console.log('🗑️ [DELETE /users/:id] Deleting user:', req.params.id);

    const deleted = await userService.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User deleted:', req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== SUSPEND USER =====
exports.suspend = async (req, res) => {
  try {
    console.log('🔒 [POST /users/:id/suspend] Suspending user:', req.params.id);

    const user = await userService.suspend(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User suspended:', user.id);

    res.json({
      success: true,
      data: user,
      message: 'User suspended successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== REACTIVATE USER =====
exports.reactivate = async (req, res) => {
  try {
    console.log('✅ [POST /users/:id/reactivate] Reactivating user:', req.params.id);

    const user = await userService.reactivate(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User reactivated:', user.id);

    res.json({
      success: true,
      data: user,
      message: 'User reactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
