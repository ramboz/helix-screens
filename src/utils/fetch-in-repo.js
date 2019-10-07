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

import rp from 'request-promise-native';

/**
 * Tries to load the `path` from the content repository.
 * @return {*} the meta props object or {@code {}}
 */
export default async (path, options, { secrets, request, logger }) => {
  const { owner, repo, ref } = request.params
  const url = `${secrets.REPO_RAW_ROOT}${owner}/${repo}/${ref}${path}`
  logger.info(`trying to load ${url}`)
  try {
    return await rp(Object.assign({ url }, options))
  } catch (e) {
    logger.info(`unable to load: ${url}`, e)
    return Promise.resolve({})
  }
}
