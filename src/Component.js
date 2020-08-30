class Component {
	constructor(template) {
		this.template = template.replace(/[\t\r\n]/g, "");
	}
}

module.exports.Component = Component;