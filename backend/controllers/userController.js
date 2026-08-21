const userService = require('../services/userService');

const toApiShape = (user) => {
  if (!user) return null;
  const plain = user.toJSON ? user.toJSON() : user;
  const [firstName, ...rest] = (plain.fullName || '').split(' ');
  return {
    ...plain,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    status: 'active',
    createdAt: plain.created_at || plain.createdAt,
    Organization: plain.Tenant ? { id: plain.Tenant.id, name: plain.Tenant.name, slug: plain.Tenant.slug } : null
  };
};

const bookingToApiShape = (booking) => {
  if (!booking) return null;
  const plain = booking.toJSON ? booking.toJSON() : booking;
  return {
    ...plain,
    bookingDate: plain.reservationDate,
    bookingStartTime: plain.startTime,
    bookingEndTime: plain.endTime,
    numberOfGuests: plain.guestCount,
    status: plain.status,
    Venue: plain.Outlet ? { id: plain.Outlet.id, name: plain.Outlet.name, city: '', address: plain.Outlet.address } : null,
    Table: plain.Table ? { id: plain.Table.id, name: plain.Table.tableNumber, capacity: plain.Table.maxCapacity } : null
  };
};

// ===== GET ALL CUSTOMERS =====
exports.listCustomers = async (req, res) => {
  try {
    console.log('👥 [GET /users/customers] Fetching all customers...');

    const customers = await userService.listCustomers();
    const data = customers.map(toApiShape);

    console.log(`✅ Found ${data.length} customers`);

    res.json({
      success: true,
      data,
      count: data.length
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
      data: toApiShape(user)
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
      data: bookings.map(bookingToApiShape),
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
      data: toApiShape(user),
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
// NOTE: new `users` table has no `status` column — suspend/reactivate retired (user decision 2026-08-21).
exports.suspend = async (req, res) => {
  console.log('🔒 [POST /users/:id/suspend] Not available in current schema');
  res.status(400).json({
    success: false,
    error: 'User suspend is not available in the current schema'
  });
};

// ===== REACTIVATE USER =====
exports.reactivate = async (req, res) => {
  console.log('✅ [POST /users/:id/reactivate] Not available in current schema');
  res.status(400).json({
    success: false,
    error: 'User reactivate is not available in the current schema'
  });
};
