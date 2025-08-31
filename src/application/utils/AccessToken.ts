import crypto from 'node:crypto';

export class AccessToken {
	private static algorithm: crypto.CipherGCMTypes = 'aes-256-gcm' as const;

	public static encrypt(token: string) {
		const iv = crypto.randomBytes(12);

		const cipher = crypto.createCipheriv(
			AccessToken.algorithm,
			process.env.ACCOUNT_ACCESS_TOKEN_KEY!,
			iv
		);

		const encryptedToken = Buffer.concat([
			cipher.update(token),
			cipher.final(),
		]);

		const authTag = cipher.getAuthTag();

		return {
			iv: `${iv.toString('hex')}##${authTag.toString('hex')}`,
			encryptedToken: encryptedToken.toString('hex'),
		};
	}

	public static decrypt(encryptedToken: string, iv: string) {
		const [encryptIV, authTag] = iv.split('##');

		const decipher = crypto.createDecipheriv(
			AccessToken.algorithm,
			process.env.ACCOUNT_ACCESS_TOKEN_KEY!,
			Buffer.from(encryptIV, 'hex')
		);
		decipher.setAuthTag(Buffer.from(authTag, 'hex'));

		const decrpyted =
			decipher.update(encryptedToken, 'hex', 'utf-8') + decipher.final('utf-8');
		return decrpyted.toString();
	}
}
