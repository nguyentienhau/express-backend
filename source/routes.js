const models = require("./models");
const { logHelper } = require("./helpers");

const { Sequelize } = models;
const branchNames = ["accounts", "categories", "collections", "products"];
const modelNames = ["Account", "Category", "Collection", "Product"];

function setupBranch(name, model) {
	return [
		{
			path: `/${name}`,
			method: "POST",
			handler: async function (request, response, next) {
				try {
					const { data } = request.body;
					const items = await model.bulkCreate(data);

					response.status(200).send({ success: true, message: "Create success", data: items });
					await next();
				} catch (error) {
					response.status(301).send({ success: false, message: "Create failed" });
					logHelper.error(error.name, error.message, "at create route in source/routes.js");
				}
			}
		},
		{
			path: `/${name}`,
			method: "GET",
			handler: async function (request, response, next) {
				try {
					const { data } = request.body;
					const items = await model.findAll({ where: { id: { [Sequelize.Op.in]: data } } });

					response.status(200).send({ success: true, message: "Read success", data: items });
					await next();
				} catch (error) {
					response.status(301).send({ success: false, message: "Read failed" });
					logHelper.error(error.name, error.message, "at read route in source/routes.js");
				}
			}
		},
		{
			path: `/${name}`,
			method: "PATCH",
			handler: async function (request, response, next) {
				try {
					const { data } = request.body;
					const items = data.map(async function (item) {
						const { id, ...newData } = item;
						return await model.update(newData, { where: { id } });
					});

					response.status(200).send({ success: true, message: "Update success", data: items });
					await next();
				} catch (error) {
					response.status(301).send({ success: false, message: "Update failed" });
					logHelper.error(error.name, error.message, "at update route in source/routes.js");
				}
			}
		},
		{
			path: `/${name}`,
			method: "DELETE",
			handler: async function (request, response, next) {
				try {
					const { data } = request.body;
					const items = await model.destroy({ where: { id: { [Sequelize.Op.in]: data } } });

					response.status(200).send({ success: true, message: "Delete success", data: items });
					await next();
				} catch (error) {
					response.status(301).send({ success: false, message: "Delete failed" });
					logHelper.error(error.name, error.message, "at delete route in source/routes.js");
				}
			}
		}
	];
}

module.exports = branchNames.reduce(function (accumulator, branchName, index) {
	return accumulator.concat(setupBranch(branchName, models[modelNames[index]]));
}, []);
