import http, { FractalResponseData, FractalResponseList } from '@/api/http';
import { ServerEggVariable, ServerStatus } from '@/api/server/types';
import { rawDataToServerAllocation, rawDataToServerEggVariable } from '@/api/transformers';

export interface Allocation {
    id: number;
    ip: string;
    alias: string | null;
    port: number;
    notes: string | null;
    isDefault: boolean;
}

export interface Nest {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
}

export interface Server {
    id: string;
    owner: boolean;
    internalId: number | string;
    uuid: string;
    name: string;
    node: string;
    isNodeUnderMaintenance: boolean;
    status: ServerStatus;
    sftpDetails: {
        ip: string;
        port: number;
    };
    invocation: string;
    dockerImage: string;
    description: string;
    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: string;
    };
    eggFeatures: string[];
    featureLimits: {
        databases: number;
        allocations: number;
        backups: number;
        backupStorageMb: number | null;
    };
    isTransferring: boolean;
    variables: ServerEggVariable[];
    allocations: Allocation[];
    egg: string;
    nest?: Nest;
}

export const rawDataToServerObject = ({ attributes: data }: FractalResponseData): Server => {
    const nestData = data.relationships?.nest as FractalResponseData | undefined;
    const nest = nestData?.attributes
        ? {
              id: nestData.attributes.id,
              uuid: nestData.attributes.uuid,
              name: nestData.attributes.name,
              description: nestData.attributes.description,
              image: nestData.attributes.image,
          }
        : undefined;

    return {
        id: data.identifier,
        owner: data.server_owner,
        internalId: data.internal_id,
        uuid: data.uuid,
        name: data.name,
        node: data.node,
        isNodeUnderMaintenance: data.is_node_under_maintenance,
        status: data.status,
        invocation: data.invocation,
        dockerImage: data.docker_image,
        sftpDetails: {
            ip: data.sftp_details.ip,
            port: data.sftp_details.port,
        },
        description: data.description ? (data.description.length > 0 ? data.description : null) : null,
        limits: { ...data.limits },
        eggFeatures: data.egg_features || [],
        featureLimits: { ...data.feature_limits },
        isTransferring: data.is_transferring,
        variables: ((data.relationships?.variables as FractalResponseList | undefined)?.data || []).map(
            rawDataToServerEggVariable,
        ),
        allocations: ((data.relationships?.allocations as FractalResponseList | undefined)?.data || []).map(
            rawDataToServerAllocation,
        ),
        egg: data.egg,
        nest,
    };
};

export default (uuid: string): Promise<[Server, string[]]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}`)
            .then(({ data }) =>
                resolve([
                    rawDataToServerObject(data),

                    data.meta?.is_server_owner ? ['*'] : data.meta?.user_permissions || [],
                ]),
            )
            .catch(reject);
    });
};
