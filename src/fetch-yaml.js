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
const fs = require('fs');
const rp = require('request-promise-native');
const yaml = require('js-yaml');

/**
 * Tries to load the `<path>.yaml` from the content repository.
 * @return {*} the meta props object or {@code {}}
 */
async function fetch(res, { secrets = {}, request, logger }) {
  const {
    owner, repo, ref, path,
  } = request.params;
  const yamlPath = res || path.replace(/\.\w+$/, '.yaml');
  const rootUrl = secrets.REPO_RAW_ROOT || 'https://raw.githubusercontent.com/';
  const url = `${rootUrl}${owner}/${repo}/${ref}${yamlPath}`;
  logger.info(`trying to load ${url}`);
  try {
    return await rp({
      url,
      transform: (data) => {
        return yaml.safeLoad(data)
      }
    });
  } catch (e) {
    try {
      const data = yaml.safeLoad(fs.readFileSync(res, 'utf8'));
      return Promise.resolve(data);
    } catch (e2) {
      logger.info('unable to load yaml: ', e2);
      return Promise.resolve({});
    }
  }
}

module.exports = fetch;
