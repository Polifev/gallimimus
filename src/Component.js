class Component {
	constructor(template) {
		this.template = template.replace(/[\t\r\n]/g, "").trim();
	}
}

module.exports.Component = Component;