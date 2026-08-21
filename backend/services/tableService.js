const { v4: uuidv4 } = require('uuid');
const Table = require('../models/Table');
const Venue = require('../models/Venue');

exports.findVenueForOrg = (venueId, organizationId) => {
  return Venue.findOne({
    where: { id: venueId, organizationId }
  });
};

exports.create = ({ venueId, name, capacity, tableType, pricePerPerson, minCapacity }) => {
  return Table.create({
    id: uuidv4(),
    venueId,
    name,
    tableNumber: `T${Math.floor(Math.random() * 1000)}`,
    capacity,
    minCapacity: minCapacity || 1,
    tableType: tableType || 'standard',
    pricePerPerson: pricePerPerson || 0
  });
};

exports.listByVenue = (venueId) => {
  return Table.findAll({
    where: { venueId }
  });
};

exports.findByIdForOrg = (id, organizationId) => {
  return Table.findOne({
    where: { id },
    include: [{
      model: Venue,
      as: 'Venue',
      where: { organizationId },
      attributes: ['id']
    }]
  });
};

exports.update = async (table, body) => {
  await table.update(body);
  return table;
};

exports.remove = (table) => {
  return table.destroy();
};
