const customerService = require('../services/customerService');

// ===== GET ALL CUSTOMERS =====
exports.list = async (req, res) => {
  try {
    console.log('👥 [GET /customers] Fetching customers for org:', req.user.organizationId);

    const customers = await customerService.listByOrganization(req.user.organizationId);

    console.log(`✅ Found ${customers.length} customers`);

    res.json({
      success: true,
      data: customers || [],
      count: customers.length,
      message: customers.length === 0 ? 'No customers found' : `Found ${customers.length} customer(s)`
    });
  } catch (error) {
    console.error('❌ Get customers error:', error);

    res.json({
      success: true,
      data: [],
      count: 0,
      message: 'No customers found'
    });
  }
};

// ===== GET CUSTOMER LOYALTY =====
exports.getLoyalty = async (req, res) => {
  const customer = await customerService.getLoyalty(req.params.id, req.user.organizationId);

  if (!customer) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }

  res.json({
    success: true,
    data: {
      customerId: customer.id,
      points: customer.loyaltyPoints,
      totalBookings: customer.totalBookings,
      segment: customer.totalBookings >= 5 ? 'repeat' : 'new'
    }
  });
};

// ===== GET SINGLE CUSTOMER PROFILE =====
exports.getOne = async (req, res) => {
  try {
    console.log('👥 [GET /customers/:id] Getting customer:', req.params.id);

    const customer = await customerService.getById(req.params.id, req.user.organizationId);

    if (!customer) {
      console.log('⚠️ Customer not found');
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    console.log('✅ Customer found');

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('❌ Get customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Customer not found'
    });
  }
};

// ===== GET CUSTOMER BOOKINGS =====
exports.getBookings = async (req, res) => {
  try {
    console.log('📋 [GET /customers/:id/bookings] Getting customer bookings:', req.params.id);

    const result = await customerService.getBookings(req.params.id, req.user.organizationId);

    if (!result) {
      return res.json({
        success: true,
        data: [],
        stats: {},
        message: 'Customer not found'
      });
    }

    console.log('✅ Bookings found:', result.bookings.length);

    res.json({
      success: true,
      data: result.bookings || [],
      stats: result.stats,
      message: 'Success'
    });
  } catch (error) {
    console.error('❌ Get customer bookings error:', error);

    res.json({
      success: true,
      data: [],
      stats: {},
      message: 'No bookings found'
    });
  }
};

// ===== UPDATE CUSTOMER PROFILE =====
exports.update = async (req, res) => {
  try {
    console.log('👥 [PATCH /customers/:id] Updating customer:', req.params.id);

    const customer = await customerService.update(req.params.id, req.user.organizationId, req.body);

    if (!customer) {
      console.log('⚠️ Customer not found for update');
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    console.log('✅ Customer updated');

    res.json({
      success: true,
      data: customer,
      message: 'Customer profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Update customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Failed to update customer'
    });
  }
};

// ===== SUSPEND CUSTOMER =====
exports.suspend = async (req, res) => {
  try {
    console.log('⛔ [POST /customers/:id/suspend] Suspending customer:', req.params.id);

    const customer = await customerService.suspend(req.params.id, req.user.organizationId, req.body.reason);

    if (!customer) {
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    console.log('✅ Customer suspended');

    res.json({
      success: true,
      data: customer,
      message: 'Customer suspended successfully'
    });
  } catch (error) {
    console.error('❌ Suspend customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Failed to suspend customer'
    });
  }
};

// ===== ACTIVATE CUSTOMER =====
exports.activate = async (req, res) => {
  try {
    console.log('✅ [POST /customers/:id/activate] Activating customer:', req.params.id);

    const customer = await customerService.activate(req.params.id, req.user.organizationId);

    if (!customer) {
      return res.json({
        success: true,
        data: null,
        message: 'Customer not found'
      });
    }

    console.log('✅ Customer activated');

    res.json({
      success: true,
      data: customer,
      message: 'Customer activated successfully'
    });
  } catch (error) {
    console.error('❌ Activate customer error:', error);

    res.json({
      success: true,
      data: null,
      message: 'Failed to activate customer'
    });
  }
};

// ===== DELETE CUSTOMER =====
exports.remove = async (req, res) => {
  try {
    console.log('🗑️ [DELETE /customers/:id] Deleting customer:', req.params.id);

    const deleted = await customerService.remove(req.params.id, req.user.organizationId);

    if (!deleted) {
      return res.json({
        success: true,
        message: 'Customer not found'
      });
    }

    console.log('✅ Customer deleted');

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete customer error:', error);

    res.json({
      success: true,
      message: 'Failed to delete customer'
    });
  }
};
