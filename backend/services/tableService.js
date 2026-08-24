const { v4: uuidv4 } = require('uuid');
const TableDaybed = require('../models/TableDaybed');
const Outlet = require('../models/Outlet');

exports.findVenueForOrg = (venueId, organizationId, role, outletId) => {
  if (['manager', 'staff'].includes(role) && outletId && venueId !== outletId) {
    return Promise.resolve(null);
  }
  return Outlet.findOne({
    where: { id: venueId, tenantId: organizationId }
  });
};

exports.create = ({ venueId, name, capacity, tableType, minCapacity }) => {
  return TableDaybed.create({
    id: uuidv4(),
    outletId: venueId,
    tableNumber: name || `T${Math.floor(Math.random() * 1000)}`,
    maxCapacity: capacity,
    minCapacity: minCapacity || 1,
    tableType: tableType || 'standard',
    isActive: true
  });
};

exports.listByVenue = (venueId) => {
  return TableDaybed.findAll({
    where: { outletId: venueId }
  });
};

exports.findByIdForOrg = (id, organizationId, role, outletId) => {
  const outletWhere = { tenantId: organizationId };
  if(['manager', 'staff'].includes(role) && outletId) {
    outletWhere.id = outletId;
  }
  return TableDaybed.findOne({
    where: { id },
    include: [{
      model: Outlet,
      as: 'Outlet',
      where: outletWhere,
      attributes: ['id']
    }]
  });
};

exports.update = async (table, body) => {
  const updateData = {};
  if ('name' in body) updateData.tableNumber = body.name;
  if ('capacity' in body) updateData.maxCapacity = body.capacity;
  if ('tableType' in body) updateData.tableType = body.tableType;
  if ('minCapacity' in body) updateData.minCapacity = body.minCapacity;

  await table.update(updateData);
  return table;
};

exports.remove = (table) => {
  return table.destroy();
};
