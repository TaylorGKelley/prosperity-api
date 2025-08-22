import crypto from 'node:crypto';

class Encrypt {
	private static algorithm: crypto.CipherGCMTypes = 'aes-256-gcm' as const;

	public static encryptSecret(secret: string) {
		const iv = crypto.randomBytes(12);

		const cipher = crypto.createCipheriv(
			Encrypt.algorithm,
			process.env.WEBHOOK_SECRET_KEY!,
			iv
		);

		const encryptedSecret = Buffer.concat([
			cipher.update(secret),
			cipher.final(),
		]);

		const authTag = cipher.getAuthTag();

		return {
			iv: `${iv.toString('hex')}##${authTag.toString('hex')}`,
			encryptedSecret: encryptedSecret.toString('hex'),
		};
	}

	public static decryptSecret(encryptedSecret: string, iv: string) {
		const [encryptIV, authTag] = iv.split('##');

		const decipher = crypto.createDecipheriv(
			Encrypt.algorithm,
			process.env.WEBHOOK_SECRET_KEY!,
			Buffer.from(encryptIV, 'hex')
		);
		decipher.setAuthTag(Buffer.from(authTag, 'hex'));

		const decrpyted =
			decipher.update(encryptedSecret, 'hex', 'utf-8') +
			decipher.final('utf-8');
		return decrpyted.toString();
	}
}
