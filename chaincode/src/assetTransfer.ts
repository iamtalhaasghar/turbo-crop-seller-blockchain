/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Crop} from './asset';

@Info({title: 'CropTransfer', description: 'Smart contract for managing crops'})
export class CropTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const crops: Crop[] = [
            {
                ID: 'crop1',
                CropName: 'Wheat',
                HarvestDate: '2023-09-15',
                BatchSize: 100,
                Owner: 'Farmer1',
            },
            {
                ID: 'crop2',
                CropName: 'Corn',
                HarvestDate: '2023-08-20',
                BatchSize: 200,
                Owner: 'Farmer2',
            },
            {
                ID: 'crop3',
                CropName: 'Rice',
                HarvestDate: '2023-07-10',
                BatchSize: 150,
                Owner: 'Farmer3',
            },
        ];

        for (const crop of crops) {
            await ctx.stub.putState(crop.ID, Buffer.from(stringify(sortKeysRecursive(crop))));
            console.info(`Crop ${crop.ID} initialized`);
        }
    }

    @Transaction()
    public async CreateCrop(ctx: Context, id: string, cropName: string, harvestDate: string, batchSize: number, owner: string): Promise<void> {
        const exists = await this.CropExists(ctx, id);
        if (exists) {
            throw new Error(`The crop ${id} already exists`);
        }

        const crop = {
            ID: id,
            CropName: cropName,
            HarvestDate: harvestDate,
            BatchSize: batchSize,
            Owner: owner,
        };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(crop))));
    }

    @Transaction(false)
    public async ReadCrop(ctx: Context, id: string): Promise<string> {
        const cropJSON = await ctx.stub.getState(id);
        if (cropJSON.length === 0) {
            throw new Error(`The crop ${id} does not exist`);
        }
        return cropJSON.toString();
    }

    @Transaction()
    public async UpdateCropInfo(ctx: Context, id: string, cropName: string, harvestDate: string, batchSize: number, owner: string): Promise<void> {
        const exists = await this.CropExists(ctx, id);
        if (!exists) {
            throw new Error(`The crop ${id} does not exist`);
        }

        const updatedCrop = {
            ID: id,
            CropName: cropName,
            HarvestDate: harvestDate,
            BatchSize: batchSize,
            Owner: owner,
        };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedCrop))));
    }

    @Transaction()
    public async DeleteCrop(ctx: Context, id: string): Promise<void> {
        const exists = await this.CropExists(ctx, id);
        if (!exists) {
            throw new Error(`The crop ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    @Transaction(false)
    @Returns('boolean')
    public async CropExists(ctx: Context, id: string): Promise<boolean> {
        const cropJSON = await ctx.stub.getState(id);
        return cropJSON.length > 0;
    }

    @Transaction()
    public async TransferCropOwnership(ctx: Context, id: string, newOwner: string): Promise<string> {
        const cropString = await this.ReadCrop(ctx, id);
        const crop = JSON.parse(cropString) as Crop;
        const oldOwner = crop.Owner;
        crop.Owner = newOwner;
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(crop))));
        return oldOwner;
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllCrops(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as Crop;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
