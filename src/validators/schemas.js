const Joi = require('joi');
const password = Joi.string().min(8).max(128).required();
module.exports = {
    register: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().email().max(254).required(),
        password
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: password
    }),
    profile: Joi.object({
        name: Joi.string().trim().min(2).max(100),
        email: Joi.string().email().max(254)
    }).min(1),
    announcement: Joi.object({
        title: Joi.string().trim().min(3).max(160).required(),
        body: Joi.string().trim().min(5).max(10000).required(),
        category: Joi.string().valid('Academic', 'Events', 'Finance', 'General', 'Other'),
        published: Joi.boolean()
    }),
    announcementPatch: Joi.object({
        title: Joi.string().trim().min(3).max(160),
        body: Joi.string().trim().min(5).max(10000),
        category: Joi.string().valid('Academic', 'Events', 'Finance', 'General', 'Other'),
        published: Joi.boolean()
    }).min(1),
    complaint: Joi.object({
        title: Joi.string().trim().min(3).max(160).required(),
        description: Joi.string().trim().min(10).max(10000).required(),
        category: Joi.string().valid('Academic', 'Accommodation', 'Finance', 'Technical', 'Other').required(),
        priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium')
    }),
    status: Joi.object({
        status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed').required()
    }),
    assign: Joi.object({
        assignedTo: Joi.string().hex().length(24).required()
    }),
    response: Joi.object({
        message: Joi.string().trim().min(1).max(5000).required()
    }),
    role: Joi.object({
        role: Joi.string().valid('student', 'admin', 'support').required()
    }),
    userStatus: Joi.object({
        status: Joi.string().valid('active', 'suspended').required()
    }),
    listQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        search: Joi.string().trim().max(100).allow(''),
        status: Joi.string(),
        category: Joi.string()
    })
};