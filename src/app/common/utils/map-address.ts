import {
  DealershipAddress,
  DealershipAddressType,
} from 'src/app/modules/dealership/entities/dealership-address.entity';

interface MappedAddresses {
  primary_address: DealershipAddress | null;
  shipping_address: DealershipAddress[];
  mailling_address: DealershipAddress[];
}

export function mapAddresses(addresses: DealershipAddress[]): MappedAddresses {
  return addresses.reduce(
    (acc: MappedAddresses, address: DealershipAddress) => {
      switch (address.type) {
        case DealershipAddressType.PRIMARY:
          acc.primary_address = address;
          break;
        case DealershipAddressType.SHIPPING:
          acc.shipping_address.push(address);
          break;
        case DealershipAddressType.MAILING:
          acc.mailling_address.push(address);
          break;
      }
      return acc;
    },
    {
      primary_address: null,
      shipping_address: [],
      mailling_address: [],
    },
  );
}
