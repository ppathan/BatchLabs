import { Type } from "@angular/core";
import { Iterable, List, OrderedSet } from "immutable";
import { Observable } from "rxjs";

import { DataCache } from "app/services/core/data-cache";
import { GenericGetter, GenericGetterConfig } from "./generic-getter";
import { ContinuationToken, ListOptions, ListOptionsAttributes } from "./list-options";

export type FetchAllProgressCallback = (count: number) => void;

export interface ListResponse<TEntity> {
    items: List<TEntity>;
    nextLink: ContinuationToken;
}

export interface ListGetterConfig<TEntity, TParams> extends GenericGetterConfig<TEntity, TParams> {
}

export abstract class ListGetter<TEntity, TParams> extends GenericGetter<TEntity, TParams>  {

    constructor(type: Type<TEntity>, config: ListGetterConfig<TEntity, TParams>) {
        super(type, config);
    }

    public fetch(params: TParams, options?: ListOptionsAttributes | ListOptions, forceNew?: boolean);
    public fetch(nextLink: ContinuationToken);
    public fetch(paramsOrNextLink: any, options: any = {}, forceNew = false): Observable<ListResponse<TEntity>> {
        if (paramsOrNextLink.nextLink) {
            return this._fetchNext(paramsOrNextLink);
        } else {
            return this._fetch(paramsOrNextLink, new ListOptions(options), forceNew);
        }
    }

    public fetchAll(
        params: TParams,
        options?: ListOptionsAttributes | ListOptions,
        progress?: FetchAllProgressCallback): Observable<List<TEntity>> {

        return this._fetch(params, new ListOptions(options), true).flatMap(({ items, nextLink }) => {
            return this._fetchRemaining(nextLink, items.size, progress)
                .map(remainingItems => List<TEntity>(items.concat(remainingItems)));
        }).share();
    }

    public fetchFromCache(params: TParams, options?: ListOptionsAttributes | ListOptions): ListResponse<TEntity> {
        const cache = this.getCache(params);
        return this._tryLoadFromCache(cache, new ListOptions(options), false);
    }

    protected abstract list(params: TParams, options: ListOptionsAttributes): Observable<TEntity[]>;
    protected abstract listNext(token: ContinuationToken): Observable<TEntity[]>;

    private _fetch(params: TParams, options: ListOptions, forceNew = false): Observable<ListResponse<TEntity>> {
        const cache = this.getCache(params);
        const cachedResponse = this._tryLoadFromCache(cache, options, forceNew);
        if (cachedResponse !== null) {
            return Observable.of(cachedResponse);
        }

        return this.list(params, options).map(x => this._processItems(cache, x, params, options, true));
    }

    private _fetchNext(token: ContinuationToken): Observable<ListResponse<TEntity>> {
        const cache = this.getCache(token.params);
        return this.listNext(token).map(x => this._processItems(cache, x, token.params, token.options, false));
    }

    private _fetchRemaining(
        nextLink: ContinuationToken,
        currentCount: number,
        progress?: FetchAllProgressCallback): Observable<Iterable<any, TEntity>> {
        if (progress) {
            progress(currentCount);
        }
        if (!nextLink) {
            return Observable.of(List([]));
        }
        return this._fetchNext(nextLink).flatMap((response) => {
            const newCount = currentCount + response.items.size;
            return this._fetchRemaining(response.nextLink, newCount, progress)
                .map(remainingItems => response.items.concat(remainingItems));
        }).share();
    }

    private _processItems(
        cache: DataCache<TEntity>,
        response: any,
        params: TParams,
        options: ListOptions,
        isFirstPage: boolean): ListResponse<TEntity> {

        const { data, nextLink } = response;
        const items = data.map(x => new this.type(x));
        const keys = OrderedSet(cache.addItems(items, options.select));
        const token = {
            nextLink,
            params,
            options,
        };

        if (items.size !== 0 && isFirstPage) {
            cache.queryCache.cacheQuery(keys, token);
        }

        return {
            items: List(items),
            nextLink: nextLink && token,
        };
    }

    /**
     * This will try to load keys from the query cache
     * This succeed only if there is no item currently loaded, we don't want new data and there is cached data.
     */
    private _tryLoadFromCache(
        cache: DataCache<TEntity>,
        options: ListOptions,
        forceNew: boolean): ListResponse<TEntity> {
        if (forceNew) {
            return null;
        }

        const cachedList = cache.queryCache.getKeys(options.filter && options.filter.toOData(), options.select);

        if (!cachedList) {
            return null;
        }

        const items = List<TEntity>(cachedList.keys.map(key => cache.get(key)));
        return {
            items,
            nextLink: cachedList.token,
        };
    }
}
