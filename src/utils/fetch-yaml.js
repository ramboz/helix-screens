/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable no-param-reassign */
const rp = require('request-promise-native');
const yaml = require('js-yaml');

/**
 * Tries to load the `<path>.yaml` from the content repository.
 * @return {*} the meta props object or {@code {}}
 */
async function fetch(yamlPath, { logger }) {
  const url = `https://raw.githubusercontent.com/ramboz/helix-screens/master${yamlPath}`;
  logger.info(`trying to load ${url}`);
  try {
    return await rp({
      url,
      transform: (data, res) => {
        const props = yaml.safeLoad(data)
        props.etag = JSON.parse(res.headers.etag || null)
        return props;
      }
    });
  } catch (e) {
    logger.info('unable to load yaml: e', e);
    return Promise.resolve({});
  }
}

module.exports = fetch;
