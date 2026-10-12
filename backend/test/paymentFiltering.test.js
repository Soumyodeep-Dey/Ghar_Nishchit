import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Contract from '../src/models/contract.model.js';
import { filterLandlordPayments } from '../src/controllers/payment.controller.js';

test('landlord payment fallback attribution uses two batched contract queries', async (context) => {
  const landlordId = new mongoose.Types.ObjectId();
  const otherLandlordId = new mongoose.Types.ObjectId();
  const ownedPropertyId = new mongoose.Types.ObjectId();
  const foreignPropertyId = new mongoose.Types.ObjectId();
  const referencedContractId = new mongoose.Types.ObjectId();
  const singleLandlordTenantId = new mongoose.Types.ObjectId();
  const sharedTenantId = new mongoose.Types.ObjectId();
  const originalFind = Contract.find;
  let queryCount = 0;

  Contract.find = (filter) => {
    queryCount += 1;
    const rows = filter._id
      ? [{ _id: referencedContractId, landlord: landlordId }]
      : [
          { tenant: singleLandlordTenantId, landlord: landlordId },
          { tenant: sharedTenantId, landlord: landlordId },
          { tenant: sharedTenantId, landlord: otherLandlordId },
        ];
    return {
      select: () => ({ lean: async () => rows }),
    };
  };
  context.after(() => {
    Contract.find = originalFind;
  });

  const payments = [
    { _id: 'property', propertyId: ownedPropertyId, tenantId: singleLandlordTenantId },
    { _id: 'contract-note', tenantId: sharedTenantId, note: `contract:${referencedContractId}` },
    { _id: 'single-landlord', tenantId: singleLandlordTenantId },
    { _id: 'shared-tenant', tenantId: sharedTenantId },
    { _id: 'foreign-property', propertyId: foreignPropertyId, tenantId: singleLandlordTenantId },
  ];

  const result = await filterLandlordPayments(payments, landlordId, [ownedPropertyId]);

  assert.deepEqual(result.map((payment) => payment._id), [
    'property',
    'contract-note',
    'single-landlord',
  ]);
  assert.equal(queryCount, 2);
});

