#!/bin/bash

create_or_find_vlan() {
  VLAN_ID=$1
  DEVICE=$2
  HOST_UUID=$(xe host-list --minimal)

  PIF_UUID=$(xe pif-list device=$DEVICE host-uuid=$HOST_UUID VLAN=-1 params=uuid --minimal | head -n1)
  if [ -z "$PIF_UUID" ]; then
    echo "NO PIF for device $DEVICE with VLAN -1"
    return 1
  fi

  NETWORK_UUID=$(xe network-list name-label="VLAN $VLAN_ID Network" --minimal | head -n1)
  if [ -n "$NETWORK_UUID" ]; then
    echo "$NETWORK_UUID"
    return 0
  fi

  VLAN_PIF_UUID=$(xe pif-list device=$DEVICE host-uuid=$HOST_UUID VLAN=$VLAN_ID params=uuid --minimal | head -n1)
  if [ -n "$VLAN_PIF_UUID" ]; then
    NETWORK_UUID=$(xe pif-param-get uuid=$VLAN_PIF_UUID param-name=network-uuid)
    echo "$NETWORK_UUID"
    return 0
  fi

  NETWORK_UUID=$(xe network-create name-label="VLAN $VLAN_ID Network" --minimal)
  echo "$NETWORK_UUID"
}

create_vm_and_attach_vlan() {
  VLAN_ID=$1
  DEVICE=$2
  TEMPLATE_NAME=$3
  VM_NAME=$4
  DESCRIPTION=$5

  VM_UUID=$(xe vm-install template="$TEMPLATE_NAME" new-name-label="$VM_NAME" --minimal)
  if [ -z "$VM_UUID" ]; then
    echo "Failed to create VM. Please check the template name and try again."
    exit 1
  fi

  xe vm-param-set uuid="$VM_UUID" other-config:description="$DESCRIPTION"
  if [ $? -ne 0 ]; then
    echo "Failed to set VM description."
    exit 1
  fi

  NETWORK_UUID=$(create_or_find_vlan "$VLAN_ID" "$DEVICE")
  if [ -z "$NETWORK_UUID" ]; then
    echo "Failed to find or create network for VLAN $VLAN_ID on $DEVICE."
    exit 1
  fi

  # Supprimer le VIF existant sur le device 0 (s'il existe)
  EXISTING_VIF_UUID=$(xe vif-list vm-uuid="$VM_UUID" device=0 params=uuid --minimal)
  if [ -n "$EXISTING_VIF_UUID" ]; then
    xe vif-destroy uuid="$EXISTING_VIF_UUID"
  fi

  # Créer le VIF sur device 0 avec le bon réseau
  xe vif-create vm-uuid="$VM_UUID" network-uuid="$NETWORK_UUID" device=0
  if [ $? -ne 0 ]; then
    echo "Failed to attach VLAN $VLAN_ID to the VM."
    exit 1
  else
    echo "VLAN $VLAN_ID successfully attached to the VM (device 0)."
  fi
}

if [ "$#" -ne 5 ]; then
  echo "Usage: $0 <VLAN_ID> <DEVICE> <TEMPLATE_NAME> <VM_NAME> <DESCRIPTION>"
  exit 1
fi

VLAN_ID=$1
DEVICE=$2
TEMPLATE_NAME=$3
VM_NAME=$4
DESCRIPTION=$5

create_vm_and_attach_vlan "$VLAN_ID" "$DEVICE" "$TEMPLATE_NAME" "$VM_NAME" "$DESCRIPTION"
