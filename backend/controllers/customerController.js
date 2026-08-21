const customerService = require('../services/customerService');

// Old frontend expects firstName/lastName separately; new schema only has full_name.
const toApiShape = (guest) => {
  if (!guest) return null;
  const plain = guest.toJSON ? guest.toJSON() : guest;
  const [firstName, ...rest] = (plain.fullName || '').split(' ');
  return {
    ...plain,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    email: plain.email,
    phone: plain.phone,
    customerType: 'regular',
    totalBookings: plain.totalVisitsCount || 0,
    totalSpent: plain.totalLifetimeSpend || 0,
    averageSpending: 0,
    lastBookingDate: plain.lastVisitAt,
    preferredContactMethod: '',
    marketingConsent: true,
    isVip: !!plain.isVip,
    tags: [],
    dateOfBirth: plain.birthday,
    anniversaryDate: plain.anniversary,
    notes: plain.generalNotes
  };
};

// ===== GET ALL CUSTOMERS =====
exports.list = async (req, res) => {
  try {
    console.log('👥 [GET /customers] Fetching customers for org:', req.user.organizationId);

    const customers = await customerService.listByOrganization(req.user.organizationId);
    const data = customers.map(toApiShape);

    console.log(`✅ Found ${data.length} customers`);

    res.json({
      success: true,
      data,
      count: data.length,
      message: data.length === 0 ? 'No customers found' : `Found ${data.length} customer(s)`
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

// ===== GET CUSTOMER LOYALTY (loyalty points no longer tracked — returns placeholder) =====
exports.getLoyalty = async (req, res) => {
  const customer = await customerService.getById(req.params.id, req.user.organizationId);

  if (!customer) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }

  res.json({
    success: true,
    data: {
      customerId: customer.id,
      points: 0,
      totalBookings: customer.totalVisitsCount || 0,
      segment: (customer.totalVisitsCount || 0) >= 5 ? 'repeat' : 'new'
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
      data: toApiShape(customer)
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

    const body = req.body;
    const updateData = {};

    if ('firstName' in body || 'lastName' in body) {
      const existing = await customerService.getById(req.params.id, req.user.organizationId);
      const currentFirst = existing?.fullName?.split(' ')[0] || '';
      const currentRest = existing?.fullName?.split(' ').slice(1).join(' ') || '';
      const firstName = 'firstName' in body ? body.firstName : currentFirst;
      const lastName = 'lastName' in body ? body.lastName : currentRest;
      updateData.fullName = [firstName, lastName].filter(Boolean).join(' ');
    }
    if ('email' in body) updateData.email = body.email;
    if ('phone' in body) updateData.phone = body.phone;
    if ('dateOfBirth' in body) updateData.birthday = body.dateOfBirth || null;
    if ('anniversaryDate' in body) updateData.anniversary = body.anniversaryDate || null;
    if ('notes' in body) updateData.generalNotes = body.notes;
    if ('isVip' in body) updateData.isVip = body.isVip;

    const customer = await customerService.update(req.params.id, req.user.organizationId, updateData);

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
      data: toApiShape(customer),
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

// ===== SUSPEND CUSTOMER (feature retired — no status column in new schema) =====
exports.suspend = async (req, res) => {
  res.status(400).json({
    success: false,
    error: 'Customer suspend/activate is not available in the current schema'
  });
};

// ===== ACTIVATE CUSTOMER (feature retired) =====
exports.activate = async (req, res) => {
  res.status(400).json({
    success: false,
    error: 'Customer suspend/activate is not available in the current schema'
  });
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
