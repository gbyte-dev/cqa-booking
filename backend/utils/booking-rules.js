function hasTimeOverlap(startTime, endTime, existingStartTime, existingEndTime) {
  return startTime < existingEndTime && endTime > existingStartTime;
}

function isWithinOperatingHours(startTime, endTime, openingTime, closingTime) {
  if (startTime >= endTime) return false;
  if (!openingTime || !closingTime) return true;
  return startTime >= openingTime && endTime <= closingTime && startTime < endTime;
}

module.exports = {
  hasTimeOverlap,
  isWithinOperatingHours
};
