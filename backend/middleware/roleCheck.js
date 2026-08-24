const requireRole = (allwedRoles) => (req , res, next) =>{
    if(!allwedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success:false,
            error:'You are not authorized to perform this action'
        });
    }
    next();
};
module.exports = requireRole;