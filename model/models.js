sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createColumnConfig: function () {
			return [{
				label: "Período",
				property: "Periodo"
			}, {
				label: "Centro",
				property: "Centro"
			}, {
				label: "Material",
				property: "Material"
			}, {
				label: "Descrição",
				property: "Descr"
			}, {
				label: "Dt.Ultima Produção",
				property: "DtUltimaProd"
			}, {
				label: "Qtd.Produzida",
				property: "QtdProduzida"
			}, {
				label: "Componente",
				property: "Componente"
			}, {
				label: "Descr.Compon.",
				property: "DescrComp"
			}, {
				label: "NCM Componente",
				property: "NCMComp"
			}, {
				label: "Qt.Compon.Util.",
				property: "QtCompUtil"
			}, {
				label: "Origem Compon.",
				property: "OrigemComp"
			}, {
				label: "Sit.Trib.Compon.",
				property: "SitTribComp"
			}, {
				label: "Origem Determ.",
				property: "OrigemDet"
			}, {
				label: "% Importação",
				property: "Importacao"
			}, {
				label: "Ultima compra Comp.",
				property: "UltimaCompra"
			}, {
				label: "Custo Ultima Compra",
				property: "CustoUltimaCompra"
			}, {
				label: "Valor Total Ult.Comp.",
				property: "TotalUltimaCompra"
			}, {
				label: "Ultima Venda",
				property: "UltimaVenda"
			}, {
				label: "Qtde.Ultima Venda",
				property: "QtdUltimaVenda"
			}, {
				label: "Preço de Venda",
				property: "PrecoVenda"
			}, {
				label: "Destino Venda",
				property: "DestinoVenda"
			}, {
				label: "Vlr.Ultima Compra Imp.",
				property: "ValorUltimaCompra"
			}, {
				label: "Custo Unitario",
				property: "CustoUnit"
			}, {
				label: "Preço Unit.Venda",
				property: "PrecoUnitVenda"
			}, {
				label: "Valor Unit. FCI",
				property: "ValorUnitFCI"
			}, {
				label: "FCI %",
				property: "FCI"
			}, {
				label: "Existe Similar ?",
				property: "ExisteSimilar"
			}, {
				label: "Conversão",
				property: "Conversao"
			}, {
				label: "Chave FCI",
				property: "ChaveFCI"
			}];
		}

	};
});