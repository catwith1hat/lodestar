import {beforeEach, describe, expect, it, vi} from "vitest";
import {getLodestarApi} from "../../../../../src/api/impl/lodestar/index.js";
import {ApiTestModules, getApiTestModules} from "../../../../utils/api.js";

describe("api / lodestar / directPeers", () => {
  let modules: ApiTestModules;
  let api: ReturnType<typeof getLodestarApi>;

  beforeEach(() => {
    modules = getApiTestModules();
    api = getLodestarApi(modules);
  });

  describe("getDirectPeers", () => {
    it("should return empty array when no direct peers", async () => {
      modules.network.getDirectPeers = vi.fn().mockResolvedValue([]);

      const result = await api.getDirectPeers();

      expect(result).toEqual({data: []});
      expect(modules.network.getDirectPeers).toHaveBeenCalledTimes(1);
    });

    it("should return list of direct peers", async () => {
      const directPeers = [
        {peerId: "16Uiu2HAkuWPWqF4W3aw9oo5Yw79v5muzBaaGTGKMmuqjPfEyfkwu", addrs: ["/ip4/192.168.1.1/tcp/9000"]},
        {peerId: "16Uiu2HAmKLhW7HiWkVNSbsZjThQTiMAqDptiqyE8FRWsRz6e8WPF", addrs: []},
      ];
      modules.network.getDirectPeers = vi.fn().mockResolvedValue(directPeers);

      const result = await api.getDirectPeers();

      expect(result).toEqual({data: directPeers});
    });
  });

  describe("addDirectPeer", () => {
    it("should add direct peer via multiaddr", async () => {
      const peerIdStr = "16Uiu2HAkuWPWqF4W3aw9oo5Yw79v5muzBaaGTGKMmuqjPfEyfkwu";
      const peerMultiaddr = `/ip4/192.168.1.1/tcp/9000/p2p/${peerIdStr}`;
      modules.network.addDirectPeer = vi.fn().mockResolvedValue({
        peerId: peerIdStr,
        addrs: ["/ip4/192.168.1.1/tcp/9000"],
      });

      await api.addDirectPeer({peer: peerMultiaddr});

      expect(modules.network.addDirectPeer).toHaveBeenCalledWith(peerMultiaddr);
    });

    it("should throw 400 error for invalid peer format", async () => {
      const invalidPeer = "invalid-peer-format";
      modules.network.addDirectPeer = vi.fn().mockResolvedValue(null);

      await expect(api.addDirectPeer({peer: invalidPeer})).rejects.toThrow(
        "Failed to parse peer: invalid-peer-format. Expected multiaddr with peer ID or ENR."
      );
    });
  });

  describe("removeDirectPeer", () => {
    it("should remove direct peer by peer ID", async () => {
      const peerIdStr = "16Uiu2HAkuWPWqF4W3aw9oo5Yw79v5muzBaaGTGKMmuqjPfEyfkwu";
      modules.network.removeDirectPeer = vi.fn().mockResolvedValue(true);

      await api.removeDirectPeer({peer: peerIdStr});

      expect(modules.network.removeDirectPeer).toHaveBeenCalledWith(peerIdStr);
    });

    it("should throw 404 error when peer not found", async () => {
      const peerIdStr = "16Uiu2HAkuWPWqF4W3aw9oo5Yw79v5muzBaaGTGKMmuqjPfEyfkwu";
      modules.network.removeDirectPeer = vi.fn().mockResolvedValue(false);

      await expect(api.removeDirectPeer({peer: peerIdStr})).rejects.toThrow(
        `Peer not found in direct peers: ${peerIdStr}`
      );
    });
  });
});
