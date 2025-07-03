/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Crop {
    @Property()
    public CropName?: string;

    @Property()
    public ID: string = '';

    @Property()
    public HarvestDate: string = '';

    @Property()
    public BatchSize: number = 0;

    @Property()
    public Owner: string = '';

    @Property()
    public Status: string = ''; // Possible values: "ready for delivery", "in transit (arrived at xyz city)", "delivered"
}
