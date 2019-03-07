import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { Collection } from 'shared/generated-types';

import { arrayToTree, HasParent, RootNode } from './array-to-tree';

export type RearrangeEvent = { collectionId: string; parentId: string; index: number };

@Component({
    selector: 'vdr-collection-tree',
    templateUrl: 'collection-tree.component.html',
    styleUrls: ['./collection-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionTreeComponent implements OnChanges {
    @Input() productCategories: Collection.Fragment[];
    @Output() rearrange = new EventEmitter<RearrangeEvent>();
    categoryTree: RootNode<Collection.Fragment>;

    ngOnChanges(changes: SimpleChanges) {
        if ('productCategories' in changes && this.productCategories) {
            this.categoryTree = arrayToTree(this.productCategories);
        }
    }

    onDrop(event: CdkDragDrop<Collection.Fragment | RootNode<Collection.Fragment>>) {
        const item = event.item.data as Collection.Fragment;
        const newParent = event.container.data;
        const newParentId = newParent.id;
        if (newParentId == null) {
            throw new Error(`Could not determine the ID of the root Collection`);
        }
        this.rearrange.emit({
            collectionId: item.id,
            parentId: newParentId,
            index: event.currentIndex,
        });
    }

    onMove(event: RearrangeEvent) {
        this.rearrange.emit(event);
    }

    private isRootNode<T extends HasParent>(node: T | RootNode<T>): node is RootNode<T> {
        return !node.hasOwnProperty('parent');
    }
}