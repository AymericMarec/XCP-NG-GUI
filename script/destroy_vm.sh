#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <VM_UUID>"
  exit 1
fi

VM_UUID=$1

VM_EXISTS=$(xe vm-list uuid=$VM_UUID --minimal)
if [ -z "$VM_EXISTS" ]; then
  echo "Erreur : VM avec UUID $VM_UUID introuvable."
  exit 1
fi

VDI_UUIDS=$(xe vbd-list vm-uuid=$VM_UUID params=vdi-uuid --minimal | tr ',' '\n' | grep -v '^$')

for VDI_UUID in $VDI_UUIDS; do
  
  VBD_UUID=$(xe vbd-list vm-uuid=$VM_UUID vdi-uuid=$VDI_UUID --minimal)
  if [ -n "$VBD_UUID" ]; then
    xe vbd-unplug uuid=$VBD_UUID
    xe vbd-destroy uuid=$VBD_UUID
  fi
  
  xe vdi-destroy uuid=$VDI_UUID
done

xe vm-shutdown uuid=$VM_UUID || echo "La VM n'était pas allumée."
xe vm-destroy uuid=$VM_UUID