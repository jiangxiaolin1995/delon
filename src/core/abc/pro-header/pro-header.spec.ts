import { Component, DebugElement, TemplateRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { MenuService, AlainThemeModule, AlainI18NService, ALAIN_I18N_TOKEN } from '@delon/theme';
import { AlainACLModule } from '@delon/acl';

import { AdProHeaderModule } from './pro-header.module';
import { ProHeaderComponent } from './pro-header.component';
import { ProHeaderConfig } from './pro-header.config';

describe('abc: pro-header', () => {
    let injector: Injector;
    let fixture: ComponentFixture<TestComponent>;
    let dl: DebugElement;
    let context: TestComponent;

    beforeEach(() => {
        injector = TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([]),
                AlainThemeModule.forRoot(),
                AlainACLModule.forRoot(),
                AdProHeaderModule.forRoot()
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            declarations: [ TestComponent ],
            providers: [
                { provide: APP_BASE_HREF, useValue: '/' }
            ]
        });
    });

    function createComp() {
        fixture = TestBed.createComponent(TestComponent);
        dl = fixture.debugElement;
        context = fixture.componentInstance;
        fixture.detectChanges();
    }

    function isExists(cls: string, stauts: boolean = true) {
        if (stauts)
            expect(dl.query(By.css(cls))).not.toBeNull();
        else
            expect(dl.query(By.css(cls))).toBeNull();
    }

    describe('[property]', () => {
        beforeEach(() => createComp());

        describe('#title', () => {
            it('with string', () => {
                isExists('.title');
            });
            it('with null', () => {
                context.title = null;
                fixture.detectChanges();
                isExists('.title', false);
            });
        });

        [ 'breadcrumb', 'logo', 'action', 'content', 'extra', 'tab' ].forEach(type => {
            it('#' + type, () => isExists('.' + type));
        });
    });

    describe('[generation breadcrumb]', () => {
        let menuSrv: MenuService;
        let route: Router;
        let i18n: AlainI18NService;
        let cog: ProHeaderConfig;
        beforeEach(() => {
            TestBed.overrideTemplate(
                TestComponent,
                `<pro-header #comp [title]="title" [autoBreadcrumb]="autoBreadcrumb"></pro-header>`
            );
            createComp();
            route = injector.get(Router);
            cog = injector.get(ProHeaderConfig);
            i18n = injector.get(ALAIN_I18N_TOKEN);

            menuSrv = injector.get(MenuService);
            menuSrv.add([
                {
                    text: 'root',
                    children: [
                        {
                            text: '1-1',
                            link: '/1-1',
                            children: [
                                { text: '1-1-1', link: '/1-1/1-1-1' },
                                { text: '1-1-2', link: '/1-1/1-1-2' }
                            ]
                        }
                    ]
                }
            ]);
        });

        it('should be', () => {
            spyOnProperty(route, 'url').and.returnValue('/1-1/1-1-2');
            context.autoBreadcrumb = true;
            fixture.detectChanges();
            expect(dl.queryAll(By.css('nz-breadcrumb-item')).length).toBe(4);
        });

        it('should be no breadcrumb when invalid url', () => {
            spyOnProperty(route, 'url').and.returnValue('/1-1/a-1-1-2');
            context.autoBreadcrumb = true;
            fixture.detectChanges();
            expect(dl.queryAll(By.css('nz-breadcrumb-item')).length).toBe(0);
        });

        it('should be hide breadcrumb', () => {
            menuSrv.add([
                {
                    text: 'root',
                    hideInBreadcrumb: true,
                    children: [
                        {
                            text: '1-1',
                            link: '/1-1',
                            children: [
                                { text: '1-1-1', link: '/1-1/1-1-1' },
                                { text: '1-1-2', link: '/1-1/1-1-2' }
                            ]
                        }
                    ]
                }
            ]);
            spyOnProperty(route, 'url').and.returnValue('/1-1/1-1-2');
            context.autoBreadcrumb = true;
            fixture.detectChanges();
            expect(dl.queryAll(By.css('nz-breadcrumb-item')).length).toBe(3);
        });

        it('should be i18n', () => {
            menuSrv.add([
                {
                    text: 'root',
                    i18n: 'root-i18n',
                    children: [
                        {
                            text: '1-1',
                            link: '/1-1',
                            children: [
                                { text: '1-1-1', link: '/1-1/1-1-1' },
                                { text: '1-1-2', link: '/1-1/1-1-2' }
                            ]
                        }
                    ]
                }
            ]);
            spyOnProperty(route, 'url').and.returnValue('/1-1/1-1-2');
            spyOn(i18n, 'fanyi');
            expect(i18n.fanyi).not.toHaveBeenCalled();
            context.autoBreadcrumb = true;
            fixture.detectChanges();
            expect(dl.queryAll(By.css('nz-breadcrumb-item')).length).toBe(4);
            expect(i18n.fanyi).toHaveBeenCalled();
        });

        describe('#home', () => {
            it('shoule be hide home', () => {
                spyOnProperty(route, 'url').and.returnValue('/1-1/1-1-2');
                cog.home = null;
                context.autoBreadcrumb = true;
                fixture.detectChanges();
                expect(dl.queryAll(By.css('nz-breadcrumb-item')).length).toBe(3);
            });
            it('shoule be i18n', () => {
                spyOnProperty(route, 'url').and.returnValue('/1-1/1-1-2');
                spyOn(i18n, 'fanyi');
                expect(i18n.fanyi).not.toHaveBeenCalled();
                cog.home_i18n = 'home_i18n';
                context.autoBreadcrumb = true;
                fixture.detectChanges();
                expect(i18n.fanyi).toHaveBeenCalled();
            });
        });
    });
});

@Component({
    template: `
    <pro-header #comp [title]="title" [autoBreadcrumb]="autoBreadcrumb">
        <ng-template #breadcrumb><div class="breadcrumb">面包屑</div></ng-template>
        <ng-template #logo><div class="logo">logo</div></ng-template>
        <ng-template #action><div class="action">action</div></ng-template>
        <ng-template #content><div class="content">content</div></ng-template>
        <ng-template #extra><div class="extra">extra</div></ng-template>
        <ng-template #tab><div class="tab">tab</div></ng-template>
    </pro-header>
    `
})
class TestComponent {
    @ViewChild('comp') comp: ProHeaderComponent;
    title = '所属类目';
    autoBreadcrumb: boolean;
}
