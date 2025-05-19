#!/bin/bash

vms=$(xe vm-list is-control-domain=false --minimal | tr ',' '\n')

echo "VM_STORAGE_USAGE:"

for vm in $vms; do
    name=$(xe vm-param-get uuid=$vm param-name=name-label)

    vbd_uuids=$(xe vbd-list vm-uuid=$vm type=Disk --minimal | tr ',' '\n')

    total_size=0

    for vbd_uuid in $vbd_uuids; do
        vdi_uuid=$(xe vbd-param-get uuid=$vbd_uuid param-name=vdi-uuid 2>/dev/null)
        if [ -n "$vdi_uuid" ]; then
            size=$(xe vdi-param-get uuid=$vdi_uuid param-name=virtual-size)
            size_gb=$(echo "scale=2; $size / (1024^3)" | bc)
            total_size=$(echo "$total_size + $size_gb" | bc)
        fi
    done

    echo "$name|$total_size"
done

sr_uuid=$(xe sr-list name-label="Local storage" --minimal)
if [ -n "$sr_uuid" ]; then
    total=$(xe sr-param-get uuid=$sr_uuid param-name=physical-size)
    used=$(xe sr-param-get uuid=$sr_uuid param-name=physical-utilisation)

    total_gb=$(echo "scale=2; $total / (1024^3)" | bc)
    used_gb=$(echo "scale=2; $used / (1024^3)" | bc)

    echo "STORAGE|$total_gb|$used_gb"
fi
