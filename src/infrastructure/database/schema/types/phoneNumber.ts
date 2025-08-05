import { customType } from 'drizzle-orm/pg-core';

const phoneNumber = customType<{
	data: string;
	notNull: false;
	default: false;
}>({
	dataType() {
		return 'varchar(20)';
	},
	toDriver(val) {
		if (
			!val.match(
				/^\+?(\d{1,3})?[-.● ]?(\(?\d{1,4}\)?)?[-.● ]?(\d{1,4})[-.● ]?(\d{1,9})$/
			)
		) {
			throw new Error('Invalid Phone Number');
		}

		return val;
	},
});

export default phoneNumber;
