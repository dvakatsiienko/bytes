if [ -f yarn.lock ]
    then rm yarn.lock
    else echo "There is no yarn.lock!"
fi

if [ -f package-lock.json ]
    then rm package-lock.json
    else echo "There is no package-lock.json!"
fi

rm -rf node_modules && yarn && rm -rf node_modules && npm i

echo "Reinstall process done"
