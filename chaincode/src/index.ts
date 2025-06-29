/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {CropTransferContract} from './assetTransfer';

export const contracts: typeof Contract[] = [CropTransferContract];
