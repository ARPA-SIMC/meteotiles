#!/bin/bash
set -e

recipes_dir="./recipes"
for p in tp t
do
    for d in 20250903 20250904
    do
        cat ${p}.$d.arkimet | arkimaps process --flavour emro_tiles --debug --output out.zip --recipes "$recipes_dir"
        rm -rf data/${d}_${p}
        mkdir -p data/${d}_${p}
        unzip -d data/${d}_${p} out.zip
        rm out.zip
    done
done
