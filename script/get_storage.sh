#!/bin/bash

# 1. Identifier l'UUID du SR "Local storage"
sr_uuid=$(xe sr-list name-label="Local storage" --minimal)
if [ -z "$sr_uuid" ]; then
  echo "Erreur : SR 'Local storage' introuvable."
  exit 1
fi

# 2. Identifier le VG associé au SR
vg_name=$(vgs --noheadings -o vg_name | grep -m1 .)
if [ -z "$vg_name" ]; then
  echo "Erreur : Aucun groupe de volumes trouvé."
  exit 1
fi

# 3. Afficher le titre
echo "VM_STORAGE_USAGE:"

# 4. Pour chaque VM (hors dom0)
xe vm-list is-control-domain=false --minimal | tr ',' '\n' | while read vm_uuid; do
  vm_name=$(xe vm-param-get uuid="$vm_uuid" param-name=name-label)
  total_usage=0

  # 5. Pour chaque VBD attaché à la VM
  xe vbd-list vm-uuid="$vm_uuid" --minimal | tr ',' '\n' | while read vbd_uuid; do
    vdi_uuid=$(xe vbd-param-get uuid="$vbd_uuid" param-name=vdi-uuid)
    if [ "$vdi_uuid" != "<not in database>" ]; then
      # 6. Identifier le LV correspondant
      lv_path="/dev/$vg_name/LV-$vdi_uuid"
      if [ -e "$lv_path" ]; then
        # 7. Obtenir l'espace utilisé en Go
        usage_bytes=$(lvs --noheadings --units b -o data_percent "$lv_path" | tr -d ' %')
        lv_size_bytes=$(lvs --noheadings --units b -o lv_size "$lv_path" | tr -d ' B')
        usage_bytes=$(echo "$lv_size_bytes * $usage_bytes / 100" | bc)
        usage_gb=$(echo "scale=2; $usage_bytes / 1024 / 1024 / 1024" | bc)
        total_usage=$(echo "$total_usage + $usage_gb" | bc)
      fi
    fi
  done

  # 8. Afficher l'utilisation de la VM
  printf "%s|%.2f\n" "$vm_name" "$total_usage"
done

# 9. Obtenir l'utilisation totale du SR
total_bytes=$(xe sr-param-get uuid="$sr_uuid" param-name=physical-size)
used_bytes=$(xe sr-param-get uuid="$sr_uuid" param-name=physical-utilisation)
total_gb=$(echo "scale=2; $total_bytes / 1024 / 1024 / 1024" | bc)
used_gb=$(echo "scale=2; $used_bytes / 1024 / 1024 / 1024" | bc)

# 10. Afficher les informations du SR
echo "STORAGE|$total_gb|$used_gb"
