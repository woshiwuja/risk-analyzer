/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 ******************************************************************************************************************** */
import { FC, PropsWithChildren, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { LOCAL_STORAGE_KEY_IEC62443_ANALYSIS } from '../../../../configs/localStorageKeys';
import { IEC62443Analysis, IEC62443_ANALYSIS_DEFAULT_VALUE } from '../../../../customTypes';
import removeLocalStorageKey from '../../../../utils/removeLocalStorageKey';
import { IEC62443Context } from '../../context';
import { IEC62443ContextProviderProps } from '../../types';

export const getLocalStorageKey = (workspaceId: string | null) => {
  if (workspaceId) {
    return `${LOCAL_STORAGE_KEY_IEC62443_ANALYSIS}_${workspaceId}`;
  }

  return LOCAL_STORAGE_KEY_IEC62443_ANALYSIS;
};

const IEC62443LocalStorageContextProvider: FC<PropsWithChildren<IEC62443ContextProviderProps>> = ({
  children,
  workspaceId: currentWorkspaceId,
}) => {
  const [iec62443Analysis, setIEC62443Analysis, { removeItem }] = useLocalStorageState<IEC62443Analysis>(getLocalStorageKey(currentWorkspaceId), {
    defaultValue: IEC62443_ANALYSIS_DEFAULT_VALUE,
  });

  const handleRemoveIEC62443Analysis = useCallback(async () => {
    removeItem();
  }, [removeItem]);

  const handleDeleteWorkspace = useCallback(async (workspaceId: string) => {
    window.setTimeout(() => {
      // to delete after the workspace is switched. Otherwise the default value is set again.
      removeLocalStorageKey(getLocalStorageKey(workspaceId));
    }, 1000);
  }, []);

  return (<IEC62443Context.Provider value={{
    iec62443Analysis,
    setIEC62443Analysis,
    removeIEC62443Analysis: handleRemoveIEC62443Analysis,
    onDeleteWorkspace: handleDeleteWorkspace,
  }}>
    {children}
  </IEC62443Context.Provider>);
};

export default IEC62443LocalStorageContextProvider;
