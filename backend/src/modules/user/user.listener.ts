import { Injectable } from '@nestjs/common';

import { AuthHelpers } from '../../shared/helpers/auth.helpers';

@Injectable()
export class UserListener {
  static async onCreated(params, next) {
    if (params.model == 'User') {
      if (params.action === 'create' || params.action === 'update') {
        const data = params.args['data'];
        if (data.password && !data.passwordHash) {
          data.passwordHash = await AuthHelpers.hash(data.password);
          delete data.password;
        }
      }
    }
    return next(params);
  }
}
