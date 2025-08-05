import { customType } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: string; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
  toDriver(val) {
    if (!val.match(/^[a-zA-Z0-9+/]+={0,2}$/)) {
      throw new Error('Image must be a base64 string');
    }

    return Buffer.from(val, 'base64');
  },
  fromDriver(val: unknown) {
    return (val as Buffer).toString('base64');
  },
});

export default bytea;
