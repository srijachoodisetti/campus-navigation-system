
import { CAMPUS_GRAPH } from "../constants";
import { RouteResult } from "../types";

export function findShortestPath(startId: string, endId: string): RouteResult | null {
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};
  const nodes = new Set<string>();

  for (const node in CAMPUS_GRAPH) {
    distances[node] = node === startId ? 0 : Infinity;
    previous[node] = null;
    nodes.add(node);
  }

  while (nodes.size > 0) {
    let closestNode = Array.from(nodes).reduce((a, b) => distances[a] < distances[b] ? a : b);

    if (distances[closestNode] === Infinity || closestNode === endId) {
      break;
    }

    nodes.delete(closestNode);

    for (const neighbor in CAMPUS_GRAPH[closestNode]) {
      const weight = CAMPUS_GRAPH[closestNode][neighbor];
      const alt = distances[closestNode] + weight;

      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = closestNode;
      }
    }
  }

  if (distances[endId] === Infinity) return null;

  const path: string[] = [];
  let current: string | null = endId;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return { path, distance: distances[endId] };
}
