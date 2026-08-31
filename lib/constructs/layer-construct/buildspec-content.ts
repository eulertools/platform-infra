export const BuildSpecContent = {
  version: '0.2',
  phases: {
    install: {
      'runtime-versions': {
        nodejs: '14',
      },
      commands: [],
    },
    build: {
      commands: [
        'echo Entering into Build Stage',
        'echo Build Started',
        'cd $LAYER_NAME',
        'npm init -y',
        'npm install $PACKAGE_NAME',
        'npm install',
        'zip -r $LAYER_NAME.zip .',
        'aws lambda publish-web3-version --web3-name $LAYER_NAME --zip-file fileb://$LAYER_NAME.zip --compatible-runtimes $COMPATIBILITY',
        'echo Layer is published',
      ],
    },
  },
};